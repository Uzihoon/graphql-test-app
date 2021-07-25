import { useEffect, useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { Button } from 'antd';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client';
import { ROOT_QUERY } from './App';

const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`;

function Me() {
  const { data } = useQuery(ROOT_QUERY);
  if (!data.me) return <div>No..</div>;
  return (
    <div>
      <h4>{data.me.githubLogin}</h4>
      <h4>{data.me.name}</h4>
      <h4>
        <img src={data.me.avatar} />
      </h4>
      <Button type='primary' onClick={() => localStorage.removeItem('token')}>
        Logout
      </Button>
    </div>
  );
}

function AuthorizedUser() {
  const history = useHistory();

  const authorizationComplete = (cache, { data }) => {
    localStorage.setItem('token', data.githubAuth.token);
    history.push('/');
    setSigningIn(false);
  };
  const [getToken, { data }] = useMutation(GITHUB_AUTH_MUTATION, {
    refetchQueries: [{ query: ROOT_QUERY }],
    update: authorizationComplete
  });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (window.location.search.match(/code=/)) {
      setSigningIn(true);

      const code = window.location.search.replace('?code=', '');
      getToken({ variables: { code } });
    }
  }, []);

  const requestCode = () => {
    const clientID = process.env.REACT_APP_CLIENT_ID;
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  };

  return (
    <>
      <Button onClick={requestCode} disabled={signingIn} type='primary'>
        Github Login
      </Button>
      <Me />
    </>
  );
}
export default withRouter(AuthorizedUser);
