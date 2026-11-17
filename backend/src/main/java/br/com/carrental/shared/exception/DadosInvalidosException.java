package br.com.carrental.shared.exception;

import org.springframework.http.HttpStatus;

/** Regra de negócio violada por dados inválidos na requisição (ex.: intervalo de datas inválido). */
public class DadosInvalidosException extends ApiException {

    public DadosInvalidosException(String mensagem) {
        super(HttpStatus.BAD_REQUEST, mensagem);
    }
}
