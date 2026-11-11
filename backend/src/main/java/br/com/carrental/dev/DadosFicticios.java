package br.com.carrental.dev;

import java.util.List;
import java.util.stream.IntStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import br.com.carrental.cliente.Cliente;
import br.com.carrental.cliente.ClienteRepository;

/**
 * Popula o banco com dados fictícios para desenvolvimento. Só existe no perfil {@code dev}
 * (ativado por {@code ./mvnw spring-boot:run}) e só age em tabelas vazias.
 * Cada módulo novo acrescenta aqui os seus dados de exemplo.
 */
@Configuration
@Profile("dev")
public class DadosFicticios {

    private static final Logger log = LoggerFactory.getLogger(DadosFicticios.class);

    private static final List<String> NOMES = List.of(
            "Ana Beatriz Carvalho", "Bruno Henrique Almeida", "Camila Ferreira Lopes", "Daniel Rocha Martins",
            "Eduarda Nogueira Pires", "Felipe Augusto Barros", "Gabriela Monteiro Dias", "Heitor Cardoso Lima",
            "Isabela Teixeira Ramos", "João Pedro Vasconcelos", "Karina Duarte Moreira", "Leonardo Batista Cunha",
            "Mariana Azevedo Santos", "Nicolas Freitas Araújo", "Olívia Rezende Campos", "Paulo Sérgio Guimarães",
            "Rafaela Mendes Correia", "Samuel Oliveira Prado", "Tatiane Borges Farias", "Ulisses Andrade Pinto",
            "Valentina Ribeiro Costa", "William Souza Tavares", "Yasmin Castro Miranda", "Zeca Moura Fonseca");

    @Bean
    ApplicationRunner popularClientes(ClienteRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            List<Cliente> clientes = IntStream.range(0, NOMES.size()).mapToObj(DadosFicticios::cliente).toList();
            repository.saveAll(clientes);
            log.info("Perfil dev: {} clientes fictícios cadastrados.", clientes.size());
        };
    }

    private static Cliente cliente(int i) {
        String nome = NOMES.get(i);
        String[] partes = nome.toLowerCase().split(" ");
        String email = semAcentos(partes[0] + "." + partes[partes.length - 1]) + "@exemplo.com";
        String telefone = "349" + String.format("%08d", 91000000 + i * 137041);
        return new Cliente(nome, cpfFicticio(i), email, telefone);
    }

    /** Gera um CPF com dígitos verificadores corretos a partir de uma base determinística. */
    private static String cpfFicticio(int i) {
        String base = String.format("%09d", 100200300 + i * 7919417L % 800000000);
        String comPrimeiro = base + digitoVerificador(base);
        return comPrimeiro + digitoVerificador(comPrimeiro);
    }

    private static int digitoVerificador(String digitos) {
        int soma = 0;
        for (int i = 0; i < digitos.length(); i++) {
            soma += (digitos.charAt(i) - '0') * (digitos.length() + 1 - i);
        }
        int resto = soma * 10 % 11;
        return resto == 10 ? 0 : resto;
    }

    private static String semAcentos(String texto) {
        return java.text.Normalizer.normalize(texto, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    }
}
