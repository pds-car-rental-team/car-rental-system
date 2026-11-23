package br.com.carrental.locacao;

import java.net.URI;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import br.com.carrental.locacao.dto.LocacaoRequest;
import br.com.carrental.locacao.dto.LocacaoResponse;
import br.com.carrental.shared.web.PaginaResponse;
import br.com.carrental.shared.web.Paginacao;
import br.com.carrental.locacao.dto.DevolucaoRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/locacoes")
@Tag(name = "Locações")
public class LocacaoController {

    private final LocacaoService service;

    public LocacaoController(LocacaoService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Registra uma nova locação")
    public ResponseEntity<LocacaoResponse> registrar(@Valid @RequestBody LocacaoRequest request) {
        LocacaoResponse locacao = service.registrar(request);
        return ResponseEntity.created(URI.create("/api/v1/locacoes/" + locacao.id())).body(locacao);
    }

    @PatchMapping("/{id}/devolucao")
    @Operation(summary = "Registra a devolução e encerra a locação")
    public LocacaoResponse devolver(@PathVariable Long id, @Valid @RequestBody DevolucaoRequest request) {
        return service.devolver(id, request);
    }

    @GetMapping
    @Operation(summary = "Lista locações com paginação e filtros opcionais por status (incluindo atrasadas) e busca")
    public PaginaResponse<LocacaoResponse> listar(
            @RequestParam(required = false) FiltroStatusLocacao status,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "" + Paginacao.TAMANHO_PADRAO) int tamanho) {
        return PaginaResponse.de(
                service.listar(status, busca, Paginacao.de(pagina, tamanho, Sort.by(Sort.Direction.DESC, "dataRetirada", "id"))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta uma locação pelo id")
    public LocacaoResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
}
