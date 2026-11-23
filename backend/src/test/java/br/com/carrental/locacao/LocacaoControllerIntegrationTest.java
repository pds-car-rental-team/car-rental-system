package br.com.carrental.locacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import br.com.carrental.TestcontainersConfiguration;
import br.com.carrental.cliente.Cliente;
import br.com.carrental.cliente.ClienteRepository;
import br.com.carrental.veiculo.CategoriaVeiculo;
import br.com.carrental.veiculo.SituacaoVeiculo;
import br.com.carrental.veiculo.Veiculo;
import br.com.carrental.veiculo.VeiculoRepository;

/** Teste de integração: HTTP + validação + transação + JPA + migrations em um PostgreSQL real (Testcontainers). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class LocacaoControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private LocacaoRepository locacaoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    private Cliente cliente;
    private Veiculo veiculoDisponivel;

    @BeforeEach
    void prepararBanco() {
        limparTabelas();

        cliente = clienteRepository.save(
                new Cliente("Maria da Silva", "52998224725", "maria@exemplo.com", "34999990000"));
        veiculoDisponivel = veiculoRepository.save(
                new Veiculo("BRA2E19", "Renault Kwid 1.0 Zen", CategoriaVeiculo.ECONOMICO,
                        new BigDecimal("120.00"), SituacaoVeiculo.DISPONIVEL));
    }

    @AfterEach
    void limparTabelas() {
        locacaoRepository.deleteAll();
        veiculoRepository.deleteAll();
        clienteRepository.deleteAll();
    }

    @Test
    void registraLocacaoEAtualizaSituacaoDoVeiculoParaAlugado() throws Exception {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(3);
        String body = """
                {"clienteId": %d, "veiculoId": %d, "dataRetirada": "%s", "dataPrevistaDevolucao": "%s"}
                """.formatted(cliente.getId(), veiculoDisponivel.getId(), retirada, devolucao);

        mvc.perform(post("/api/v1/locacoes").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.clienteId").value(cliente.getId()))
                .andExpect(jsonPath("$.clienteNome").value("Maria da Silva"))
                .andExpect(jsonPath("$.veiculoId").value(veiculoDisponivel.getId()))
                .andExpect(jsonPath("$.veiculoPlaca").value("BRA2E19"))
                .andExpect(jsonPath("$.valorDiaria").value(120.00))
                .andExpect(jsonPath("$.valorPrevisto").value(360.00))
                .andExpect(jsonPath("$.status").value("ABERTA"));

        Veiculo atualizado = veiculoRepository.findById(veiculoDisponivel.getId()).orElseThrow();
        assertThat(atualizado.getSituacao()).isEqualTo(SituacaoVeiculo.ALUGADO);

        mvc.perform(get("/api/v1/locacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].veiculoPlaca").value("BRA2E19"));
    }

    @Test
    void bloqueiaLocacaoDeVeiculoIndisponivel() throws Exception {
        veiculoDisponivel.alterarSituacao(SituacaoVeiculo.ALUGADO);
        veiculoRepository.save(veiculoDisponivel);

        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);
        String body = """
                {"clienteId": %d, "veiculoId": %d, "dataRetirada": "%s", "dataPrevistaDevolucao": "%s"}
                """.formatted(cliente.getId(), veiculoDisponivel.getId(), retirada, devolucao);

        mvc.perform(post("/api/v1/locacoes").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Veículo não está disponível para locação."));
    }

    @Test
    void rejeitaDatasInvalidas() throws Exception {
        LocalDate retirada = LocalDate.now().plusDays(3);
        LocalDate devolucao = retirada.minusDays(1);
        String body = """
                {"clienteId": %d, "veiculoId": %d, "dataRetirada": "%s", "dataPrevistaDevolucao": "%s"}
                """.formatted(cliente.getId(), veiculoDisponivel.getId(), retirada, devolucao);

        mvc.perform(post("/api/v1/locacoes").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("A data prevista de devolução não pode ser anterior à data de retirada."));
    }

    @Test
    void rejeitaCamposObrigatoriosAusentes() throws Exception {
        mvc.perform(post("/api/v1/locacoes").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros", hasSize(4)));
    }

    @Test
    void retornaNotFoundQuandoClienteOuVeiculoNaoExiste() throws Exception {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);
        String body = """
                {"clienteId": 99999, "veiculoId": %d, "dataRetirada": "%s", "dataPrevistaDevolucao": "%s"}
                """.formatted(veiculoDisponivel.getId(), retirada, devolucao);

        mvc.perform(post("/api/v1/locacoes").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void listaLocacoesFiltrandoPorStatusAtrasada() throws Exception {
        LocalDate hoje = LocalDate.now();
        Cliente outroCliente = clienteRepository.save(
                new Cliente("João Pereira", "11144477735", "joao@exemplo.com", "34999991111"));
        Veiculo veiculo2 = veiculoRepository.save(
                new Veiculo("DEF2G34", "Toyota Corolla GLi 2.0", CategoriaVeiculo.SEDAN,
                        new BigDecimal("250.00"), SituacaoVeiculo.ALUGADO));
        Veiculo veiculo3 = veiculoRepository.save(
                new Veiculo("GHI3J45", "Fiat Mobi Like 1.0", CategoriaVeiculo.ECONOMICO,
                        new BigDecimal("110.00"), SituacaoVeiculo.DISPONIVEL));

        // Aberta e atrasada (data prevista no passado)
        locacaoRepository.save(new Locacao(
                cliente, veiculoDisponivel, hoje.minusDays(5), hoje.minusDays(1), null,
                new BigDecimal("120.00"), new BigDecimal("480.00"), StatusLocacao.ABERTA));
        // Aberta e no prazo (data prevista hoje ou futuro)
        locacaoRepository.save(new Locacao(
                outroCliente, veiculo2, hoje.minusDays(1), hoje.plusDays(2), null,
                new BigDecimal("250.00"), new BigDecimal("750.00"), StatusLocacao.ABERTA));
        // Finalizada com data prevista no passado (não deve entrar como atrasada)
        locacaoRepository.save(new Locacao(
                cliente, veiculo3, hoje.minusDays(10), hoje.minusDays(7), hoje.minusDays(7),
                new BigDecimal("110.00"), new BigDecimal("330.00"), StatusLocacao.FINALIZADA));
        // Cancelada com data prevista no passado (não deve entrar como atrasada)
        locacaoRepository.save(new Locacao(
                outroCliente, veiculo3, hoje.minusDays(8), hoje.minusDays(5), null,
                new BigDecimal("110.00"), new BigDecimal("330.00"), StatusLocacao.CANCELADA));

        mvc.perform(get("/api/v1/locacoes").param("status", "ATRASADA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].clienteNome").value("Maria da Silva"))
                .andExpect(jsonPath("$.itens[0].veiculoPlaca").value("BRA2E19"))
                .andExpect(jsonPath("$.itens[0].status").value("ABERTA"))
                .andExpect(jsonPath("$.itens[0].atrasada").value(true));

        mvc.perform(get("/api/v1/locacoes").param("status", "ABERTA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].clienteNome").value("João Pereira"))
                .andExpect(jsonPath("$.itens[0].atrasada").value(false));

        mvc.perform(get("/api/v1/locacoes").param("status", "FINALIZADA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].atrasada").value(false));
    }

    @Test
    void listaLocacoesFiltrandoPorBuscaDeClienteCpfPlacaEModelo() throws Exception {
        LocalDate hoje = LocalDate.now();
        Cliente outroCliente = clienteRepository.save(
                new Cliente("Carlos Eduardo", "11144477735", "carlos@exemplo.com", "34999992222"));
        Veiculo outroVeiculo = veiculoRepository.save(
                new Veiculo("XYZ9K88", "Toyota Corolla GLi 2.0", CategoriaVeiculo.SEDAN,
                        new BigDecimal("240.00"), SituacaoVeiculo.ALUGADO));

        locacaoRepository.save(new Locacao(
                cliente, veiculoDisponivel, hoje.minusDays(4), hoje.minusDays(1), null,
                new BigDecimal("120.00"), new BigDecimal("360.00"), StatusLocacao.ABERTA));
        locacaoRepository.save(new Locacao(
                outroCliente, outroVeiculo, hoje, hoje.plusDays(3), null,
                new BigDecimal("240.00"), new BigDecimal("720.00"), StatusLocacao.ABERTA));

        // Busca por nome do cliente (case-insensitive)
        mvc.perform(get("/api/v1/locacoes").param("busca", "carlos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].clienteNome").value("Carlos Eduardo"));

        // Busca por CPF formatado
        mvc.perform(get("/api/v1/locacoes").param("busca", "529.982.247-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].clienteNome").value("Maria da Silva"));

        // Busca por placa com hífen e minúsculas
        mvc.perform(get("/api/v1/locacoes").param("busca", "xyz-9k88"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].veiculoPlaca").value("XYZ9K88"));

        // Busca por modelo do veículo
        mvc.perform(get("/api/v1/locacoes").param("busca", "kwid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].veiculoModelo").value("Renault Kwid 1.0 Zen"));

        // Combinação de filtro de atrasadas + busca
        mvc.perform(get("/api/v1/locacoes").param("status", "ATRASADA").param("busca", "carlos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(0));

        mvc.perform(get("/api/v1/locacoes").param("status", "ATRASADA").param("busca", "maria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.itens[0].atrasada").value(true));
    }

    @Test
    void listaLocacoesComPaginacao() throws Exception {
        LocalDate hoje = LocalDate.now();
        for (int i = 0; i < 3; i++) {
            locacaoRepository.save(new Locacao(
                    cliente, veiculoDisponivel, hoje.minusDays(10L - i), hoje.minusDays(8L - i),
                    hoje.minusDays(8L - i), new BigDecimal("120.00"), new BigDecimal("240.00"),
                    StatusLocacao.FINALIZADA));
        }

        mvc.perform(get("/api/v1/locacoes").param("pagina", "0").param("tamanho", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(2)))
                .andExpect(jsonPath("$.pagina").value(0))
                .andExpect(jsonPath("$.tamanho").value(2))
                .andExpect(jsonPath("$.totalItens").value(3))
                .andExpect(jsonPath("$.totalPaginas").value(2));

        mvc.perform(get("/api/v1/locacoes").param("pagina", "1").param("tamanho", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.pagina").value(1));
    }

    @Test
    void rejeitaStatusInvalidoNaListagem() throws Exception {
        mvc.perform(get("/api/v1/locacoes").param("status", "INEXISTENTE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registraDevolucaoFinalizaLocacaoELiberaVeiculo() throws Exception {
        veiculoDisponivel.alterarSituacao(SituacaoVeiculo.ALUGADO);
        veiculoRepository.save(veiculoDisponivel);

        LocalDate retirada = LocalDate.now().minusDays(4);
        LocalDate prevista = LocalDate.now().minusDays(1);
        LocalDate devolucao = LocalDate.now();
        Locacao aberta = locacaoRepository.save(new Locacao(
                cliente, veiculoDisponivel, retirada, prevista, null,
                new BigDecimal("120.00"), new BigDecimal("360.00"), StatusLocacao.ABERTA));

        String body = """
                {"dataDevolucao": "%s", "situacaoVeiculo": "DISPONIVEL"}
                """.formatted(devolucao);

        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", aberta.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"))
                .andExpect(jsonPath("$.dataDevolucao").value(devolucao.toString()))
                .andExpect(jsonPath("$.valorFinal").value(480.00))
                .andExpect(jsonPath("$.atrasada").value(false));

        Veiculo atualizado = veiculoRepository.findById(veiculoDisponivel.getId()).orElseThrow();
        assertThat(atualizado.getSituacao()).isEqualTo(SituacaoVeiculo.DISPONIVEL);
    }

    @Test
    void registraDevolucaoComVeiculoEmManutencao() throws Exception {
        veiculoDisponivel.alterarSituacao(SituacaoVeiculo.ALUGADO);
        veiculoRepository.save(veiculoDisponivel);

        LocalDate retirada = LocalDate.now().minusDays(2);
        LocalDate devolucao = LocalDate.now();
        Locacao aberta = locacaoRepository.save(new Locacao(
                cliente, veiculoDisponivel, retirada, devolucao, null,
                new BigDecimal("120.00"), new BigDecimal("240.00"), StatusLocacao.ABERTA));

        String body = """
                {"dataDevolucao": "%s", "situacaoVeiculo": "EM_MANUTENCAO"}
                """.formatted(devolucao);

        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", aberta.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"))
                .andExpect(jsonPath("$.valorFinal").value(240.00));

        Veiculo atualizado = veiculoRepository.findById(veiculoDisponivel.getId()).orElseThrow();
        assertThat(atualizado.getSituacao()).isEqualTo(SituacaoVeiculo.EM_MANUTENCAO);
    }

    @Test
    void rejeitaDevolucaoInvalidaInexistenteOuJaFinalizada() throws Exception {
        LocalDate retirada = LocalDate.now().minusDays(2);
        Locacao aberta = locacaoRepository.save(new Locacao(
                cliente, veiculoDisponivel, retirada, LocalDate.now().plusDays(1), null,
                new BigDecimal("120.00"), new BigDecimal("360.00"), StatusLocacao.ABERTA));

        // 400 - situação ALUGADO não permitida na devolução
        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", aberta.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dataDevolucao": "%s", "situacaoVeiculo": "ALUGADO"}
                                """.formatted(LocalDate.now())))
                .andExpect(status().isBadRequest());

        // 400 - data anterior à retirada
        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", aberta.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dataDevolucao": "%s", "situacaoVeiculo": "DISPONIVEL"}
                                """.formatted(retirada.minusDays(1))))
                .andExpect(status().isBadRequest());

        // 404 - locação inexistente
        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", 99999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dataDevolucao": "%s", "situacaoVeiculo": "DISPONIVEL"}
                                """.formatted(LocalDate.now())))
                .andExpect(status().isNotFound());

        // Finaliza a locação e tenta devolver novamente -> 409
        aberta.devolver(LocalDate.now(), new BigDecimal("240.00"));
        locacaoRepository.save(aberta);

        mvc.perform(patch("/api/v1/locacoes/{id}/devolucao", aberta.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dataDevolucao": "%s", "situacaoVeiculo": "DISPONIVEL"}
                                """.formatted(LocalDate.now())))
                .andExpect(status().isConflict());
    }
}
