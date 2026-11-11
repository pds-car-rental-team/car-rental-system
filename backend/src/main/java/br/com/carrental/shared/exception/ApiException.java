package br.com.carrental.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Base das exceções de negócio. A mensagem é exibida ao usuário, então deve ser
 * clara, em português e sem detalhes internos.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
