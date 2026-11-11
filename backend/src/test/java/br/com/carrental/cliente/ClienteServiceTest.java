package br.com.carrental.cliente;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import br.com.carrental.cliente.dto.ClienteRequest;
import br.com.carrental.cliente.dto.ClienteResponse;
import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    private static final Pageable PAGINA = PageRequest.of(0, 20);

    @Mock
    private ClienteRepository repository;

    @InjectMocks
    private ClienteService service;

    private static ClienteRequest requestValido() {
        return new ClienteRequest("  Maria da Silva ", "529.982.247-25", " Maria@Exemplo.com ", "(34) 99999-0000");
    }

    private static Cliente clienteExistente() {
        return new Cliente("Maria da Silva", "52998224725", "maria@exemplo.com", "34999990000");
    }

    @Test
    void criarSalvaClienteComDadosNormalizados() {
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.save(any(Cliente.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        ClienteResponse resposta = service.criar(requestValido());

        ArgumentCaptor<Cliente> salvo = ArgumentCaptor.forClass(Cliente.class);
        verify(repository).save(salvo.capture());
        assertThat(salvo.getValue().getNome()).isEqualTo("Maria da Silva");
        assertThat(salvo.getValue().getCpf()).isEqualTo("52998224725");
        assertThat(salvo.getValue().getEmail()).isEqualTo("maria@exemplo.com");
        assertThat(salvo.getValue().getTelefone()).isEqualTo("34999990000");
        assertThat(resposta.cpf()).isEqualTo("52998224725");
    }

    @Test
    void criarBloqueiaCpfDuplicado() {
        when(repository.existsByCpf("52998224725")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(requestValido()))
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("CPF");
        verify(repository, never()).save(any());
    }

    @Test
    void buscarPorIdRetornaCliente() {
        when(repository.findById(1L)).thenReturn(Optional.of(clienteExistente()));

        assertThat(service.buscarPorId(1L).nome()).isEqualTo("Maria da Silva");
    }

    @Test
    void buscarPorIdInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void listarSemBuscaRetornaTodos() {
        when(repository.findAll(PAGINA)).thenReturn(new PageImpl<>(List.of(clienteExistente())));

        Page<ClienteResponse> pagina = service.listar("  ", PAGINA);

        assertThat(pagina.getContent()).hasSize(1);
    }

    @Test
    void listarComDigitosBuscaPeloInicioDoCpf() {
        when(repository.findByCpfStartingWith("529982", PAGINA)).thenReturn(Page.empty());

        service.listar("529.982", PAGINA);

        verify(repository).findByCpfStartingWith("529982", PAGINA);
    }

    @Test
    void listarComTextoBuscaPorNome() {
        when(repository.findByNomeContainingIgnoreCase("maria", PAGINA)).thenReturn(Page.empty());

        service.listar(" maria ", PAGINA);

        verify(repository).findByNomeContainingIgnoreCase("maria", PAGINA);
    }

    @Test
    void atualizarAlteraDadosDoCliente() {
        Cliente cliente = clienteExistente();
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));
        when(repository.existsByCpfAndIdNot("11144477735", 1L)).thenReturn(false);
        when(repository.saveAndFlush(cliente)).thenReturn(cliente);

        ClienteResponse resposta = service.atualizar(1L,
                new ClienteRequest("Maria Souza", "111.444.777-35", "souza@exemplo.com", "3432100000"));

        assertThat(resposta.nome()).isEqualTo("Maria Souza");
        assertThat(resposta.cpf()).isEqualTo("11144477735");
        assertThat(resposta.email()).isEqualTo("souza@exemplo.com");
        assertThat(resposta.telefone()).isEqualTo("3432100000");
    }

    @Test
    void atualizarBloqueiaCpfDeOutroCliente() {
        when(repository.findById(1L)).thenReturn(Optional.of(clienteExistente()));
        when(repository.existsByCpfAndIdNot("52998224725", 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.atualizar(1L, requestValido()))
                .isInstanceOf(ConflitoException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void atualizarInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99L, requestValido()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void excluirRemoveCliente() {
        Cliente cliente = clienteExistente();
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));

        service.excluir(1L);

        verify(repository).delete(cliente);
    }

    @Test
    void excluirInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.excluir(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        verify(repository, never()).delete(any());
    }
}
