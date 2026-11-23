package br.com.carrental.locacao;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import br.com.carrental.cliente.Cliente;
import br.com.carrental.veiculo.Veiculo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "locacao")
public class Locacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @Column(name = "data_retirada", nullable = false)
    private LocalDate dataRetirada;

    @Column(name = "data_prevista_devolucao", nullable = false)
    private LocalDate dataPrevistaDevolucao;

    @Column(name = "data_devolucao")
    private LocalDate dataDevolucao;

    /** Snapshot do valor da diária do veículo no momento do registro da locação. */
    @Column(name = "valor_diaria", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDiaria;

    @Column(name = "valor_previsto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorPrevisto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusLocacao status;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Locacao() {
        // exigido pelo JPA
    }

    public Locacao(
            Cliente cliente,
            Veiculo veiculo,
            LocalDate dataRetirada,
            LocalDate dataPrevistaDevolucao,
            BigDecimal valorDiaria,
            BigDecimal valorPrevisto,
            StatusLocacao status) {
        this(cliente, veiculo, dataRetirada, dataPrevistaDevolucao, null, valorDiaria, valorPrevisto, status);
    }

    public Locacao(
            Cliente cliente,
            Veiculo veiculo,
            LocalDate dataRetirada,
            LocalDate dataPrevistaDevolucao,
            LocalDate dataDevolucao,
            BigDecimal valorDiaria,
            BigDecimal valorPrevisto,
            StatusLocacao status) {
        this.cliente = cliente;
        this.veiculo = veiculo;
        this.dataRetirada = dataRetirada;
        this.dataPrevistaDevolucao = dataPrevistaDevolucao;
        this.dataDevolucao = dataDevolucao;
        this.valorDiaria = valorDiaria;
        this.valorPrevisto = valorPrevisto;
        this.status = status;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public LocalDate getDataRetirada() {
        return dataRetirada;
    }

    public LocalDate getDataPrevistaDevolucao() {
        return dataPrevistaDevolucao;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public BigDecimal getValorDiaria() {
        return valorDiaria;
    }

    public BigDecimal getValorPrevisto() {
        return valorPrevisto;
    }

    public StatusLocacao getStatus() {
        return status;
    }

    /** Uma locação está atrasada quando continua aberta após a data prevista de devolução. */
    public boolean estaAtrasada(LocalDate referencia) {
        return status == StatusLocacao.ABERTA && dataPrevistaDevolucao.isBefore(referencia);
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
