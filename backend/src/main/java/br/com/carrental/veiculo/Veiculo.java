package br.com.carrental.veiculo;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "veiculo")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Somente letras maiúsculas e dígitos, sem hífen. Única no sistema. */
    @Column(nullable = false, length = 7, unique = true)
    private String placa;

    @Column(nullable = false, length = 120)
    private String modelo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoriaVeiculo categoria;

    @Column(name = "valor_diaria", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDiaria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SituacaoVeiculo situacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Veiculo() {
        // exigido pelo JPA
    }

    public Veiculo(String placa, String modelo, CategoriaVeiculo categoria, BigDecimal valorDiaria,
            SituacaoVeiculo situacao) {
        this.placa = placa;
        this.modelo = modelo;
        this.categoria = categoria;
        this.valorDiaria = valorDiaria;
        this.situacao = situacao;
    }

    public void atualizar(String placa, String modelo, CategoriaVeiculo categoria, BigDecimal valorDiaria,
            SituacaoVeiculo situacao) {
        this.placa = placa;
        this.modelo = modelo;
        this.categoria = categoria;
        this.valorDiaria = valorDiaria;
        this.situacao = situacao;
    }

    public void alterarSituacao(SituacaoVeiculo novaSituacao) {
        this.situacao = novaSituacao;
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

    public String getPlaca() {
        return placa;
    }

    public String getModelo() {
        return modelo;
    }

    public CategoriaVeiculo getCategoria() {
        return categoria;
    }

    public BigDecimal getValorDiaria() {
        return valorDiaria;
    }

    public SituacaoVeiculo getSituacao() {
        return situacao;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}

