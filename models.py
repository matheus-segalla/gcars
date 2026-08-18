from datetime import datetime
from database import Base
from sqlalchemy import (
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
    nome = Column(String, index=True)
    veiculos = relationship("VeiculoModel", back_populates="cliente")


class VeiculoModel(Base):
    __tablename__ = "veiculos"
    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String, index=True)
    modelo = Column(String)
    cor = Column(String, nullable=True)
    ano = Column(String, nullable=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))

    cliente = relationship("ClienteModel", back_populates="veiculos")
    ordens = relationship("OrdemServicoModel", back_populates="veiculo")


class OrdemServicoModel(Base):
    __tablename__ = "ordens_servico"
    id = Column(Integer, primary_key=True, index=True)
    numero_orcamento = Column(String, index=True)
    data_os = Column(String)
    km = Column(String, nullable=True)
    pecas = Column(Float, default=0.0)
    mao_obra = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    forma_pagamento = Column(String, nullable=True)
    fotos_json = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    veiculo = relationship("VeiculoModel", back_populates="ordens")
    servicos = relationship("ItemServicoModel", back_populates="ordem")


class ItemServicoModel(Base):
    __tablename__ = "itens_servico"
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(Text)
    ordem_id = Column(Integer, ForeignKey("ordens_servico.id"))
    ordem = relationship("OrdemServicoModel", back_populates="servicos")