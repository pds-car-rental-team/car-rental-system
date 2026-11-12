package br.com.carrental.veiculo;

import java.net.URI;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.carrental.shared.web.PaginaResponse;
import br.com.carrental.shared.web.Paginacao;
import br.com.carrental.veiculo.dto.DisponibilidadeResumoResponse;
import br.com.carrental.veiculo.dto.VeiculoRequest;
import br.com.carrental.veiculo.dto.VeiculoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/veiculos")
@Tag(name = "Veículos")
public class VeiculoController {

    private final VeiculoService service;

    public VeiculoController(VeiculoService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Cadastra um veículo")
    public ResponseEntity<VeiculoResponse> criar(@Valid @RequestBody VeiculoRequest request) {
        VeiculoResponse veiculo = service.criar(request);
        return ResponseEntity.created(URI.create("/api/v1/veiculos/" + veiculo.id())).body(veiculo);
    }

    @GetMapping
    @Operation(summary = "Lista veículos com paginação e filtros por situação, categoria e busca por placa ou modelo")
    public PaginaResponse<VeiculoResponse> listar(
            @RequestParam(required = false) SituacaoVeiculo situacao,
            @RequestParam(required = false) CategoriaVeiculo categoria,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "" + Paginacao.TAMANHO_PADRAO) int tamanho) {
        return PaginaResponse.de(
                service.listar(situacao, categoria, busca, Paginacao.de(pagina, tamanho, Sort.by("modelo"))));
    }

    @GetMapping("/disponibilidade")
    @Operation(summary = "Consulta a contagem de veículos por situação de disponibilidade")
    public DisponibilidadeResumoResponse consultarDisponibilidade(
            @RequestParam(required = false) CategoriaVeiculo categoria) {
        return service.consultarResumoDisponibilidade(categoria);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta um veículo pelo id")
    public VeiculoResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza os dados de um veículo")
    public VeiculoResponse atualizar(@PathVariable Long id, @Valid @RequestBody VeiculoRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui um veículo")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}

