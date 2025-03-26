export function getTokenParameters(params: RegExpMatchArray | null) {
  if (!params) {
    return null;
  }

  const name = params[1];
  let genericProps;
  let arrayProps;
  let modificator;

  for (const parameter of params.slice(2)) {
    if (!parameter) {
      continue;
    }

    if (parameter.includes('<')) {
      genericProps = parameter.replace('<', '').replace('>', '');
      continue;
    }

    if (parameter.includes('{')) {
      arrayProps = parameter
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map((item) => parseInt(item));
    }

    if (['*', '?', '+'].includes(parameter)) {
      modificator = parameter;
      continue;
    }
  }

  return { name, genericProps, arrayProps, modificator };
}
