const urlFor = (url, params = {}) => `${url}?${new URLSearchParams(params)}`;

const redirect = (url) => {
  window.location = url;
};

const startAuthorization = ({ baseUrl, clientId, scope }) =>
  redirect(
    urlFor(`${baseUrl}/authorize`, {
      client_id: clientId,
      redirect_uri: `${window.location.origin}/#!/`,
      state: window.location.hash,
      scope,
      response_type: 'code',
    }),
  );

const fetchAccessToken = (code, { baseUrl, clientId, scope }) =>
  new Promise((resolve, reject) =>
    fetch(`${baseUrl}/token`, {
      method: 'POST',
      body: new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: `${window.location.origin}/#!/`,
        grant_type: 'authorization_code',
        scope,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((res) => res.json())
      .then((token) => {
        if (token.error) {
          return reject(token.error);
        }
        return resolve(token.access_token);
      })
      .catch((e) => reject(e)),
  );

const getQueryParameters = () => {
  const queryParams = {};
  const { href } = window.location;
  if (href.indexOf('?')) {
    const params = href.substring(href.indexOf('?') + 1).split('&');
    params.forEach((e) => {
      const [k, v] = e.split('=');
      queryParams[k] = v;
    });
  }
  return queryParams;
};

const getCode = () => {
  const { code, state } = getQueryParameters();
  if (code && state) {
    window.location.hash = decodeURIComponent(state);
  }
  return code;
};

export const login = (opts) => {
  const code = getCode();
  return !code ? startAuthorization(opts) : fetchAccessToken(code, opts);
};
