import datetime
import json
import re
from collections import Counter
from typing import Optional
import re
import unicodedata

from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import (
    ClienteModel,
    FuncionarioModel,
    ItemServicoModel,
    OrdemServicoModel,
    VeiculoModel,
)
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/relatorios", tags=["Relatórios & Estatísticas"])


def converter_data_segura(data_val) -> Optional[datetime.date]:
    if not data_val:
        return None
    if isinstance(data_val, datetime.date):
        return data_val
    if isinstance(data_val, datetime.datetime):
        return data_val.date()

    data_limpa = str(data_val).strip()
    formatos = ["%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d", "%d-%m-%Y"]
    for fmt in formatos:
        try:
            return datetime.datetime.strptime(data_limpa, fmt).date()
        except ValueError:
            continue
    return None

def remover_acentos(texto: str) -> str:
    """Remove acentos e caracteres especiais para comparação uniforme."""
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', texto)
    return "".join([c for c in nfkd if not unicodedata.combining(c)]).lower().strip()


def normalizar_nome_servico(texto: str) -> str:
    """Padroniza a grafia dos mesmos serviços sem fundir itens distintos."""
    if not texto:
        return ""

    t_sem_parenteses = re.sub(r"\(.*?\)", "", texto).strip()
    if t_sem_parenteses.startswith("*") or "pecas fornecidas" in remover_acentos(t_sem_parenteses):
        return ""

    t = remover_acentos(t_sem_parenteses)

    # 1. Filtros (unifica preposições e singular/plural)
    if "filtro" in t:
        if "combust" in t:
            return "Substituir Filtro de Combustível"
        if "oleo" in t:
            return "Substituir Filtro de Óleo"
        if "ar condicionado" in t or "cabine" in t:
            return "Substituir Filtro de Ar Condicionado"
        if " ar" in t or t.endswith("ar"):
            return "Substituir Filtro de Ar"

    # 2. Troca de Óleo do Motor (unifica viscosidades 5W30, 15W40, etc.)
    if "oleo" in t and "cambio" not in t and ("troca" in t or "substitu" in t or "w" in t):
        return "Troca de Óleo do Motor"

    # 3. Velas (não mistura com cabos)
    if "vela" in t and "cabo" not in t:
        return "Substituir Velas de Ignição"

    # 4. Bobinas (não mistura com chicote)
    if "bobina" in t and "chicote" not in t:
        return "Substituir Bobinas de Ignição"

    # 5. Formatação limpa para os demais itens
    palavras = t_sem_parenteses.split()
    conectores = {"de", "do", "da", "dos", "das", "e", "em", "no", "na"}
    resultado = [
        p.lower() if i > 0 and p.lower() in conectores else p.capitalize()
        for i, p in enumerate(palavras)
    ]
    return " ".join(resultado)
@router.get("/estatisticas")
def obter_estatisticas(
    periodo: str = Query("mes", description="semana, mes, ano, geral"),
    db: Session = Depends(get_db),
):
    try:
        hoje = datetime.date.today()
        todas_ordens = db.query(OrdemServicoModel).all()

        ordens_filtradas = []
        for os_item in todas_ordens:
            dt = converter_data_segura(os_item.data_os)
            if not dt:
                if periodo == "geral":
                    ordens_filtradas.append(os_item)
                continue

            if periodo == "semana":
                if (hoje - dt).days <= 7:
                    ordens_filtradas.append(os_item)
            elif periodo == "mes":
                if dt.month == hoje.month and dt.year == hoje.year:
                    ordens_filtradas.append(os_item)
            elif periodo == "ano":
                if dt.year == hoje.year:
                    ordens_filtradas.append(os_item)
            else:
                ordens_filtradas.append(os_item)

        total_ordens = len(ordens_filtradas)

        # Acumuladores Financeiros
        faturamento_total = 0.0
        total_recebido = 0.0
        total_a_receber = 0.0
        total_descontos = 0.0
        total_pecas = 0.0
        total_mao_obra = 0.0
        custo_total = 0.0

        ordens_pendentes = []

        for o in ordens_filtradas:
            tot = float(o.total or 0.0)
            pec = float(o.pecas or 0.0)
            mo = float(o.mao_obra or 0.0)
            desc = float(getattr(o, "desconto", 0.0) or 0.0)
            cst = float(o.custo or 0.0)
            pago = float(getattr(o, "valor_pago", 0.0) or 0.0)

            if tot == 0.0 and (pec + mo) > 0:
                tot = max(0.0, (pec + mo) - desc)

            saldo_restante = max(0.0, tot - pago)

            faturamento_total += tot
            total_recebido += pago
            total_a_receber += saldo_restante
            total_descontos += desc
            total_pecas += pec
            total_mao_obra += mo
            custo_total += cst

            if saldo_restante > 0.01:
                cliente_obj = (
                    o.veiculo.cliente
                    if (o.veiculo and o.veiculo.cliente)
                    else None
                )
                veiculo_obj = o.veiculo if o.veiculo else None

                ordens_pendentes.append({
                    "id": o.id,
                    "numero_orcamento": o.numero_orcamento,
                    "data": o.data_os,
                    "cliente": (
                        cliente_obj.nome if cliente_obj else "Não informado"
                    ),
                    "telefone": cliente_obj.telefone if cliente_obj else None,
                    "veiculo": (
                        f"{veiculo_obj.modelo} ({veiculo_obj.placa or 'Sem placa'})"
                        if veiculo_obj
                        else "Não informado"
                    ),
                    "total": tot,
                    "valor_pago": pago,
                    "restante": saldo_restante,
                    "status_pagamento": (
                        getattr(o, "status_pagamento", "pendente") or "pendente"
                    ),
                    "forma_pagamento": o.forma_pagamento or "N/A",
                })

        ordens_pendentes.sort(key=lambda x: x["restante"], reverse=True)

        lucro_previsto = faturamento_total - custo_total
        lucro_real = total_recebido - custo_total

        margem_lucro = (
            (lucro_previsto / faturamento_total * 100)
            if faturamento_total > 0
            else 0.0
        )
        ticket_medio = (
            (faturamento_total / total_ordens) if total_ordens > 0 else 0.0
        )
        taxa_inadimplencia = (
            (total_a_receber / faturamento_total * 100)
            if faturamento_total > 0
            else 0.0
        )

        # Formas de Pagamento
        pagamentos_map = {}
        for o in ordens_filtradas:
            fp = o.forma_pagamento or "Não Informado"
            pagamentos_map[fp] = pagamentos_map.get(fp, 0.0) + float(
                o.total or 0.0
            )

        formas_pagamento = [
            {
                "metodo": k,
                "valor": v,
                "percentual": (
                    (v / faturamento_total * 100)
                    if faturamento_total > 0
                    else 0
                ),
            }
            for k, v in pagamentos_map.items()
        ]
        formas_pagamento.sort(key=lambda x: x["valor"], reverse=True)

        # 🛠️ Top Serviços com Agrupamento e Normalização
        contador_servicos = Counter()
        for os_item in ordens_filtradas:
            itens_encontrados = []

            # 1. Tenta extrair da relação 'itens'
            itens_rel = getattr(os_item, "itens", None)
            if itens_rel:
                for it in itens_rel:
                    nome = (
                        getattr(it, "descricao", None)
                        or getattr(it, "nome", None)
                        or getattr(it, "servico", None)
                    )
                    if nome and isinstance(nome, str):
                        itens_encontrados.append(nome)

            # 2. Se não houver em 'itens', extrai do campo 'servicos' da OS
            if not itens_encontrados:
                campo_servicos = getattr(os_item, "servicos", None) or getattr(
                    os_item, "servicos_json", None
                )
                if campo_servicos:
                    if isinstance(campo_servicos, list):
                        itens_encontrados.extend(campo_servicos)
                    elif isinstance(campo_servicos, str):
                        texto = campo_servicos.strip()
                        if texto.startswith("[") and texto.endswith("]"):
                            try:
                                parsed = json.loads(texto)
                                if isinstance(parsed, list):
                                    itens_encontrados.extend(parsed)
                            except Exception:
                                itens_encontrados.extend(texto.splitlines())
                        else:
                            itens_encontrados.extend(texto.splitlines())

            # 3. Normaliza e contabiliza
            for s in itens_encontrados:
                if not s or not isinstance(s, str):
                    continue
                servico_formatado = normalizar_nome_servico(s)
                if servico_formatado and len(servico_formatado) > 2:
                    contador_servicos[servico_formatado] += 1

        top_servicos = [
            {
                "descricao": k,
                "nome": k,
                "total": v,
                "quantidade": v,
            }
            for k, v in contador_servicos.most_common(8)
        ]

        return {
            "periodo": periodo,
            "total_ordens": total_ordens,
            "faturamento_total": faturamento_total,
            "total_recebido": total_recebido,
            "total_a_receber": total_a_receber,
            "total_descontos": total_descontos,
            "taxa_inadimplencia": round(taxa_inadimplencia, 1),
            "total_pecas": total_pecas,
            "total_mao_obra": total_mao_obra,
            "custo_total": custo_total,
            "lucro_previsto": lucro_previsto,
            "lucro_real": lucro_real,
            "margem_lucro": margem_lucro,
            "ticket_medio": ticket_medio,
            "formas_pagamento": formas_pagamento,
            "top_servicos": top_servicos,
            "pendencias": ordens_pendentes,
        }

    except Exception as e:
        print("❌ Erro no cálculo de estatísticas:", e)
        raise HTTPException(status_code=500, detail=str(e))