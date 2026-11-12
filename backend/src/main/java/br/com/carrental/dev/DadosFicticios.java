package br.com.carrental.dev;

import java.math.BigDecimal;
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
import br.com.carrental.veiculo.CategoriaVeiculo;
import br.com.carrental.veiculo.SituacaoVeiculo;
import br.com.carrental.veiculo.Veiculo;
import br.com.carrental.veiculo.VeiculoRepository;

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
            "Isabela Teixeira Ramos", "João Pedro Vasconcelos", "Karina Duarte Moreira", "Leonardo Batista Cunha");

    private static final List<Veiculo> VEICULOS = List.of(
            new Veiculo("BRA2E19", "Renault Kwid 1.0 Zen", CategoriaVeiculo.ECONOMICO, new BigDecimal("119.90"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("QWE4R56", "Fiat Mobi Like 1.0", CategoriaVeiculo.ECONOMICO, new BigDecimal("115.00"), SituacaoVeiculo.ALUGADO),
            new Veiculo("RTY7U89", "Chevrolet Onix 1.0 LT", CategoriaVeiculo.HATCH, new BigDecimal("149.90"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("UIO1P23", "Hyundai HB20 Comfort 1.0", CategoriaVeiculo.HATCH, new BigDecimal("154.90"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("ASD4F56", "Volkswagen Polo Track 1.0", CategoriaVeiculo.HATCH, new BigDecimal("159.00"), SituacaoVeiculo.EM_MANUTENCAO),
            new Veiculo("GHJ7K89", "Toyota Corolla GLi 2.0", CategoriaVeiculo.SEDAN, new BigDecimal("249.90"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("ZKL2M34", "Chevrolet Onix Plus LTZ", CategoriaVeiculo.SEDAN, new BigDecimal("179.90"), SituacaoVeiculo.ALUGADO),
            new Veiculo("XCV5B67", "Honda City Touring 1.5", CategoriaVeiculo.SEDAN, new BigDecimal("229.00"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("BNM8Q12", "Jeep Compass Longitude 1.3", CategoriaVeiculo.SUV, new BigDecimal("289.90"), SituacaoVeiculo.ALUGADO),
            new Veiculo("PLM3N45", "Volkswagen T-Cross 200 TSI", CategoriaVeiculo.SUV, new BigDecimal("259.90"), SituacaoVeiculo.DISPONIVEL),
            new Veiculo("OKN6J78", "Hyundai Creta Action 1.6", CategoriaVeiculo.SUV, new BigDecimal("239.90"), SituacaoVeiculo.EM_MANUTENCAO),
            new Veiculo("IJB9V01", "Fiat Strada Freedom 1.3", CategoriaVeiculo.UTILITARIO, new BigDecimal("219.90"), SituacaoVeiculo.DISPONIVEL));

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

    @Bean
    ApplicationRunner popularVeiculos(VeiculoRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            repository.saveAll(VEICULOS);
            log.info("Perfil dev: {} veículos fictícios cadastrados.", VEICULOS.size());
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
