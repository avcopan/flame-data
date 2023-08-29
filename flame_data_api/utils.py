from collections.abc import Sequence


def row_with_array_literals(row: dict) -> dict:
    """Replace sequences in a table row with array literals

    :param row: A row dictionary
    :type row: dict
    :return: The row dictionary, with sequence values replaced with array literals
    :rtype: dict
    """
    return {
        k: array_literal(v) if is_nonstring_sequence(v) else v for k, v in row.items()
    }


def array_literal(seq: list) -> str:
    """Form a Postgres array literal from a sequence

    :param seq: A sequence of items
    :type seq: list
    :return: The array literal
    :rtype: str
    """
    seq = [f'"{item}"' if isinstance(item, str) else str(item) for item in seq]
    return f"{{{','.join(seq)}}}"


def is_nonstring_sequence(obj) -> bool:
    """Is this object a non-string sequence?

    :param obj: Any object
    :return: `True` if it is, `False` if it isn't
    :rtype: bool
    """
    return isinstance(obj, Sequence) and not isinstance(obj, str)
