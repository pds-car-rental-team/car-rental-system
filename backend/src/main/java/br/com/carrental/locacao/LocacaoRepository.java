package br.com.carrental.locacao;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LocacaoRepository extends JpaRepository<Locacao, Long> {

    @Override
    @EntityGraph(attributePaths = { "cliente", "veiculo" })
    Optional<Locacao> findById(Long id);

    @EntityGraph(attributePaths = { "cliente", "veiculo" })
    @Query("""
            SELECT l FROM Locacao l
            WHERE (:status IS NULL OR l.status = :status)
              AND (:somenteNoPrazo = FALSE OR l.dataPrevistaDevolucao >= :hoje)
              AND (:somenteAtrasadas = FALSE OR l.dataPrevistaDevolucao < :hoje)
              AND (:busca = ''
                   OR LOWER(l.cliente.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR LOWER(l.veiculo.modelo) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR (:buscaCpf <> '' AND l.cliente.cpf LIKE CONCAT('%', :buscaCpf, '%'))
                   OR (:buscaPlaca <> '' AND l.veiculo.placa LIKE CONCAT('%', :buscaPlaca, '%')))
            """)
    Page<Locacao> filtrar(
            @Param("status") StatusLocacao status,
            @Param("somenteNoPrazo") boolean somenteNoPrazo,
            @Param("somenteAtrasadas") boolean somenteAtrasadas,
            @Param("hoje") LocalDate hoje,
            @Param("busca") String busca,
            @Param("buscaCpf") String buscaCpf,
            @Param("buscaPlaca") String buscaPlaca,
            Pageable pageable);
}
