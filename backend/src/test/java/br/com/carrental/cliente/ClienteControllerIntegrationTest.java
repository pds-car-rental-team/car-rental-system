package br.com.carrental.cliente;

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
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import br.com.carrental.TestcontainersConfiguration;

/** Teste de integração: HTTP + validação + JPA + migrations em um PostgreSQL real (Testcontainers). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class ClienteControllerIntegrationTest {

    private static final String MARIA = """
            {"nome": "Maria da Silva", "cpf": "529.982.247-25", "email": "maria@exemplo.com", "telefone": "(34) 99999-0000"}
            """;

    private static final String JOAO = """
            {"nome": "João Souza", "cpf": "11144477735", "email": "joao@exemplo.com", "telefone": "3432100000"}
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ClienteRepository repository;

    @BeforeEach
    void limparBanco() {
        repository.deleteAll();
    }

    private void cadastrar(String json) throws Exception {
        mvc.perform(post("/api/v1/clientes").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void cadastraEConsultaCliente() throws Exception {
        mvc.perform(post("/api/v1/clientes").contentType(MediaType.APPLICATION_JSON).content(MARIA))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.cpf").value("52998224725"))
                .andExpect(jsonPath("$.telefone").value("34999990000"));

        Long id = repository.findAll().getFirst().getId();
        mvc.perform(get("/api/v1/clientes/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Maria da Silva"));
    }

    @Test
    void bloqueiaCpfDuplicado() throws Exception {
        cadastrar(MARIA);

        mvc.perform(post("/api/v1/clientes").contentType(MediaType.APPLICATION_JSON).content(MARIA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe um cliente cadastrado com este CPF."));
    }

    @Test
    void rejeitaDadosInvalidosComErrosPorCampo() throws Exception {
        String invalido = """
                {"nome": "", "cpf": "123.456.789-00", "email": "nao-e-email", "telefone": "123"}
                """;

        mvc.perform(post("/api/v1/clientes").contentType(MediaType.APPLICATION_JSON).content(invalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros", hasSize(4)));
    }

    @Test
    void listaComPaginacaoEBusca() throws Exception {
        cadastrar(MARIA);
        cadastrar(JOAO);

        mvc.perform(get("/api/v1/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItens").value(2))
                .andExpect(jsonPath("$.itens[0].nome").value("João Souza"));

        mvc.perform(get("/api/v1/clientes").param("busca", "mar"))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].nome").value("Maria da Silva"));

        mvc.perform(get("/api/v1/clientes").param("busca", "111.444"))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].nome").value("João Souza"));
    }

    @Test
    void atualizaEExcluiCliente() throws Exception {
        cadastrar(MARIA);
        cadastrar(JOAO);
        Long idMaria = repository.findByCpfStartingWith("529", Pageable.unpaged())
                .getContent().getFirst().getId();

        mvc.perform(put("/api/v1/clientes/{id}", idMaria).contentType(MediaType.APPLICATION_JSON)
                        .content(MARIA.replace("Maria da Silva", "Maria Oliveira")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Maria Oliveira"));

        mvc.perform(put("/api/v1/clientes/{id}", idMaria).contentType(MediaType.APPLICATION_JSON)
                        .content(JOAO))
                .andExpect(status().isConflict());

        mvc.perform(delete("/api/v1/clientes/{id}", idMaria)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/clientes/{id}", idMaria)).andExpect(status().isNotFound());
    }
}
