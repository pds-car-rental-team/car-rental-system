package br.com.carrental.locacao;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocacaoRepository extends JpaRepository<Locacao, Long> {

    @Override
    @EntityGraph(attributePaths = { "cliente", "veiculo" })
    Optional<Locacao> findById(Long id);

    @Override
    @EntityGraph(attributePaths = { "cliente", "veiculo" })
    Page<Locacao> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "veiculo" })
    Page<Locacao> findByStatus(StatusLocacao status, Pageable pageable);
}
