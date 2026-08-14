import secrets

# Sin 0/O ni 1/I/L: el codigo se dicta en voz alta en una sala de clases y se
# escribe en el pizarron. Un caracter ambiguo se traduce en alumnos que no entran.
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 6


def generate_room_code() -> str:
    """Genera un codigo de sala legible.

    Usa `secrets` y no `random` porque el codigo es la unica credencial que
    hace falta para entrar a una sala: debe ser impredecible.
    """
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
