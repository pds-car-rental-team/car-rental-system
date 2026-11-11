package br.com.carrental.shared.exception;

import org.springframework.http.HttpStatus;

/** Violação de unicidade ou de estado (ex.: CPF já cadastrado). */
public class ConflitoException extends ApiException {

    public ConflitoException(String mensagem) {
        super(HttpStatus.CONFLICT, mensagem);
    }
}
