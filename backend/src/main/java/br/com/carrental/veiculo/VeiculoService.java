package br.com.carrental.veiculo;

import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;
import br.com.carrental.veiculo.VeiculoRepository.ContagemPorSituacao;
import br.com.carrental.veiculo.dto.DisponibilidadeResumoResponse;
import br.com.carrental.veiculo.dto.VeiculoRequest;
import br.com.carrental.veiculo.dto.VeiculoResponse;

@Service
@Transactional(readOnly = true)
public class VeiculoService {

    private final VeiculoRepository repository;

    public VeiculoService(VeiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public VeiculoResponse criar(VeiculoRequest request) {
        String placa = normalizarPlaca(request.placa());
        if (repository.existsByPlaca(placa)) {
            throw placaDuplicada();
        }

        Veiculo veiculo = new Veiculo(
                placa,
                request.modelo().trim(),
                request.categoria(),
                request.valorDiaria(),
                request.situacao());
        return VeiculoResponse.de(repository.save(veiculo));
    }

    public VeiculoResponse buscarPorId(Long id) {
        return VeiculoResponse.de(obter(id));
    }

    /**
     * Lista veículos paginados com filtros opcionais de situação, categoria e termo de busca
     * (placa ou modelo).
     */
    public Page<VeiculoResponse> listar(
            SituacaoVeiculo situacao,
            CategoriaVeiculo categoria,
            String busca,
            Pageable pageable) {
        String termo = busca == null ? "" : busca.trim();
        String buscaPlaca = normalizarPlaca(termo);
        return repository.filtrar(situacao, categoria, termo, buscaPlaca, pageable)
                .map(VeiculoResponse::de);
    }

    /**
     * Calcula no banco a quantidade de veículos em cada situação (disponíveis, alugados e em manutenção),
     * opcionalmente filtrada por categoria.
     */
    public DisponibilidadeResumoResponse consultarResumoDisponibilidade(CategoriaVeiculo categoria) {
        List<ContagemPorSituacao> contagens = repository.contarPorSituacao(categoria);
        Map<SituacaoVeiculo, Long> mapa = new EnumMap<>(SituacaoVeiculo.class);
        for (ContagemPorSituacao item : contagens) {
            mapa.put(item.getSituacao(), item.getQuantidade());
        }

        long disponiveis = mapa.getOrDefault(SituacaoVeiculo.DISPONIVEL, 0L);
        long alugados = mapa.getOrDefault(SituacaoVeiculo.ALUGADO, 0L);
        long emManutencao = mapa.getOrDefault(SituacaoVeiculo.EM_MANUTENCAO, 0L);
        long total = disponiveis + alugados + emManutencao;

        return new DisponibilidadeResumoResponse(total, disponiveis, alugados, emManutencao);
    }

    @Transactional
    public VeiculoResponse atualizar(Long id, VeiculoRequest request) {
        Veiculo veiculo = obter(id);

        String placa = normalizarPlaca(request.placa());
        if (repository.existsByPlacaAndIdNot(placa, id)) {
            throw placaDuplicada();
        }

        veiculo.atualizar(
                placa,
                request.modelo().trim(),
                request.categoria(),
                request.valorDiaria(),
                request.situacao());
        return VeiculoResponse.de(repository.saveAndFlush(veiculo));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(obter(id));
    }

    private Veiculo obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Veículo não encontrado."));
    }

    private static String normalizarPlaca(String valor) {
        return valor == null ? "" : valor.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
    }

    private static ConflitoException placaDuplicada() {
        return new ConflitoException("Já existe um veículo cadastrado com esta placa.");
    }
}

