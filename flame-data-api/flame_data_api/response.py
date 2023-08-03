from typing import Tuple


def response(code: int, **kwargs) -> Tuple[dict, int]:
  """Generate a status for returning from API endpoings

  Any keyword arguments passed in will go into a dictionary that will become a
  JSON body in the response

  :param code: The status code (200, 409, etc.)
  :type code: int
  :return: The keyword arguments and the return code
  :rtype: Tuple[dict, int]
  """
  return kwargs, code
