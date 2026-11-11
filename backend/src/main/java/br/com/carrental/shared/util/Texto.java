package br.com.carrental.shared.util;

public final class Texto {

    private Texto() {
    }

    /** Remove máscara de documentos e telefones: {@code "123.456.789-09"} vira {@code "12345678909"}. */
    public static String apenasDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}
