package br.com.carrental.veiculo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    interface ContagemPorSituacao {
        SituacaoVeiculo getSituacao();

        long getQuantidade();
    }

    boolean existsByPlaca(String placa);

    boolean existsByPlacaAndIdNot(String placa, Long id);

    @Query("""
            SELECT v FROM Veiculo v
            WHERE (:situacao IS NULL OR v.situacao = :situacao)
              AND (:categoria IS NULL OR v.categoria = :categoria)
              AND (:busca = '' OR LOWER(v.modelo) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR (:buscaPlaca <> '' AND v.placa LIKE CONCAT('%', :buscaPlaca, '%')))
            """)
    Page<Veiculo> filtrar(
            @Param("situacao") SituacaoVeiculo situacao,
            @Param("categoria") CategoriaVeiculo categoria,
            @Param("busca") String busca,
            @Param("buscaPlaca") String buscaPlaca,
            Pageable pageable);

    @Query("""
            SELECT v.situacao AS situacao, COUNT(v) AS quantidade
            FROM Veiculo v
            WHERE (:categoria IS NULL OR v.categoria = :categoria)
            GROUP BY v.situacao
            """)
    List<ContagemPorSituacao> contarPorSituacao(@Param("categoria") CategoriaVeiculo categoria);
}

