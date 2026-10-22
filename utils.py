import datetime
from typing import Optional


def converter_data_segura(data_val) -> Optional[datetime.date]:
    """
    Converte com segurança valores de data (string, date, datetime) para datetime.date.
    Suporta formatos comuns como DD/MM/YYYY, DD/MM/YY, YYYY-MM-DD e DD-MM-YYYY.
    """
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
