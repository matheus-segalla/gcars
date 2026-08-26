import datetime
from database import Base
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship


class ClienteModel(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    telefone = Column(String, nullable=True)
    cpf = Column(String, nullable=True)

    veiculos = relationship(
        "VeiculoModel", back_populates="cliente", cascade="all, delete-orphan"
    )


class VeiculoModel(Base):
    __tablename__ = "veiculos"

    id = Column(Integer, primary_key=True, index=True)
    modelo = Column(String, nullable=False)
    placa = Column(String, nullable=True)
    cor = Column(String, nullable=True)
    ano = Column(String, nullable=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))

    cliente = relationship("ClienteModel", back_populates="veiculos")
    ordens = relationship(
        "OrdemServicoModel",
        back_populates="veiculo",
        cascade="all, delete-orphan",
    )


class FuncionarioModel(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cargo = Column(String(50), default="Mecânico")
    ativo = Column(Boolean, default=True)
    criado_em = Column(
        DateTime(timezone=True), default=datetime.datetime.utcnow
    )

    ordens = relationship("OrdemServicoModel", back_populates="funcionario")


class OrdemServicoModel(Base):
    __tablename__ = "ordens_servico"

    id = Column(Integer, primary_key=True, index=True)
    numero_orcamento = Column(String, nullable=False)
    data_os = Column(String, nullable=False)
    km = Column(String, nullable=True)
    forma_pagamento = Column(String, nullable=True)
    pecas = Column(Float, default=0.0)
    mao_obra = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    custo = Column(Float, default=0.0)
    fotos_json = Column(Text, nullable=True)

    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    funcionario_id = Column(
        Integer, ForeignKey("funcionarios.id"), nullable=True
    )

    veiculo = relationship("VeiculoModel", back_populates="ordens")
    funcionario = relationship("FuncionarioModel", back_populates="ordens")
    itens = relationship(
        "ItemServicoModel", back_populates="ordem", cascade="all, delete-orphan"
    )


class ItemServicoModel(Base):
    __tablename__ = "itens_servico"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    ordem_id = Column(Integer, ForeignKey("ordens_servico.id"))

    ordem = relationship("OrdemServicoModel", back_populates="itens")