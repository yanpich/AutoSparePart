package com.real.autosparepart.common.exception;

public class RefreshTokenExpiredException extends RuntimeException {
  public RefreshTokenExpiredException(String message) {
    super(message);
  }
}
