import { useEffect, useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { Button } from 'antd';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { ROOT_QUERY } from './App';

const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`;

function AuthorizedUser() {
  const history = useHistory();

  const authorizationComplete = (cache, { data }) => {
    localStorage.setItem('token', data.githubAuth.token);
    history.push('/');
    setSigningIn(false);
  };

  const [getToken] = useMutation(GITHUB_AUTH_MUTATION, {
    refetchQueries: [{ query: ROOT_QUERY }],
    update: authorizationComplete
  });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (window.location.search.match(/code=/)) {
      setSigningIn(true);

      const code = window.location.search.replace('?code=', '');
      getToken(code);
    }
  }, []);

  const requestCode = () => {
    const clientID = process.env.REACT_APP_CLIENT_ID;
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  };

  return (
    <Button onClick={requestCode} disabled={signingIn} type='primary'>
      Github Login
    </Button>
  );
}
export default withRouter(AuthorizedUser);
