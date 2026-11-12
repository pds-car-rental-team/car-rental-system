package br.com.carrental.veiculo;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import br.com.carrental.TestcontainersConfiguration;

/** Teste de integração de veículos e disponibilidade da frota com PostgreSQL real (Testcontainers). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class VeiculoControllerIntegrationTest {

    private static final String PULSE_DISPONIVEL = """
            {
              "placa": "ABC-1D23",
              "modelo": "Fiat Pulse 1.3",
              "categoria": "SUV",
              "valorDiaria": 189.90,
              "situacao": "DISPONIVEL"
            }
            """;

    private static final String COROLLA_ALUGADO = """
            {
              "placa": "DEF2G34",
              "modelo": "Toyota Corolla 2.0",
              "categoria": "SEDAN",
              "valorDiaria": 249.90,
              "situacao": "ALUGADO"
            }
            """;

    private static final String COMPASS_MANUTENCAO = """
            {
              "placa": "GHI3J45",
              "modelo": "Jeep Compass 1.3",
              "categoria": "SUV",
              "valorDiaria": 289.90,
              "situacao": "EM_MANUTENCAO"
            }
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private VeiculoRepository repository;

    @BeforeEach
    void limparBanco() {
        repository.deleteAll();
    }

    private void cadastrar(String json) throws Exception {
        mvc.perform(post("/api/v1/veiculos").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void cadastraEConsultaVeiculo() throws Exception {
        mvc.perform(post("/api/v1/veiculos").contentType(MediaType.APPLICATION_JSON).content(PULSE_DISPONIVEL))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.placa").value("ABC1D23"))
                .andExpect(jsonPath("$.situacao").value("DISPONIVEL"));

        Long id = repository.findAll().getFirst().getId();
        mvc.perform(get("/api/v1/veiculos/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modelo").value("Fiat Pulse 1.3"));
    }

    @Test
    void filtraFrotaPorSituacaoCategoriaEBusca() throws Exception {
        cadastrar(PULSE_DISPONIVEL);
        cadastrar(COROLLA_ALUGADO);
        cadastrar(COMPASS_MANUTENCAO);

        mvc.perform(get("/api/v1/veiculos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(3));

        mvc.perform(get("/api/v1/veiculos").param("situacao", "DISPONIVEL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].modelo").value("Fiat Pulse 1.3"));

        mvc.perform(get("/api/v1/veiculos").param("categoria", "SUV"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(2)));

        mvc.perform(get("/api/v1/veiculos")
                        .param("categoria", "SUV")
                        .param("situacao", "EM_MANUTENCAO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].modelo").value("Jeep Compass 1.3"));

        mvc.perform(get("/api/v1/veiculos").param("busca", "abc-1d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].placa").value("ABC1D23"));

        mvc.perform(get("/api/v1/veiculos").param("busca", "corolla"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].placa").value("DEF2G34"));
    }

    @Test
    void consultaContagemDeDisponibilidadePorSituacao() throws Exception {
        cadastrar(PULSE_DISPONIVEL);
        cadastrar(COROLLA_ALUGADO);
        cadastrar(COMPASS_MANUTENCAO);

        mvc.perform(get("/api/v1/veiculos/disponibilidade"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.disponiveis").value(1))
                .andExpect(jsonPath("$.alugados").value(1))
                .andExpect(jsonPath("$.emManutencao").value(1));

        mvc.perform(get("/api/v1/veiculos/disponibilidade").param("categoria", "SUV"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.disponiveis").value(1))
                .andExpect(jsonPath("$.alugados").value(0))
                .andExpect(jsonPath("$.emManutencao").value(1));
    }

    @Test
    void rejeitaFiltroComValorInexistente() throws Exception {
        mvc.perform(get("/api/v1/veiculos").param("situacao", "XYZ"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Valor inválido para o parâmetro 'situacao'."));

        mvc.perform(get("/api/v1/veiculos/disponibilidade").param("categoria", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Valor inválido para o parâmetro 'categoria'."));
    }

    @Test
    void bloqueiaPlacaDuplicadaERejeitaDadosInvalidos() throws Exception {
        cadastrar(PULSE_DISPONIVEL);

        mvc.perform(post("/api/v1/veiculos").contentType(MediaType.APPLICATION_JSON).content(PULSE_DISPONIVEL))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe um veículo cadastrado com esta placa."));

        String invalido = """
                {"placa": "123", "modelo": "", "categoria": null, "valorDiaria": -10, "situacao": null}
                """;
        mvc.perform(post("/api/v1/veiculos").contentType(MediaType.APPLICATION_JSON).content(invalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros", hasSize(5)));
    }

    @Test
    void atualizaEExcluiVeiculo() throws Exception {
        cadastrar(PULSE_DISPONIVEL);
        Long id = repository.findAll().getFirst().getId();

        mvc.perform(put("/api/v1/veiculos/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .content(PULSE_DISPONIVEL.replace("DISPONIVEL", "ALUGADO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("ALUGADO"));

        mvc.perform(delete("/api/v1/veiculos/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/veiculos/{id}", id)).andExpect(status().isNotFound());
    }
}

