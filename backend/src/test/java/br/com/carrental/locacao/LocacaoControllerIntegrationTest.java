package br.com.carrental.locacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
}
