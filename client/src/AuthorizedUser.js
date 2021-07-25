import { useEffect, useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { Button, List } from 'antd';
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

function Me({ data }) {
  if (!data || !data.me) return <div />;
  return (
    <List style={{ marginBottom: '30px', backgroundColor: '#00bcd4' }}>
      <List.Item style={{ width: '90%', margin: 'auto', padding: '20px' }}>
        <h4 style={{ color: '#fff' }}>
          <img
            src={data.me.avatar}
            alt=''
            style={{ width: '50px', height: '50px', marginRight: '30px' }}
          />
          <b>{data.me.name || data.me.githubLogin}</b>
        </h4>
        <Button onClick={() => localStorage.removeItem('token')}>Logout</Button>
      </List.Item>
    </List>
  );
}

function AuthorizedUser() {
  const history = useHistory();
  const { data } = useQuery(ROOT_QUERY);
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
      getToken({ variables: { code } });
    }
  }, []);

  const requestCode = () => {
    const clientID = process.env.REACT_APP_CLIENT_ID;
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  };

  return (
    <>
      {!data || !data.me ? (
        <Button onClick={requestCode} disabled={signingIn} type='primary'>
          Github Login
        </Button>
      ) : (
        <Me data={data} />
      )}
    </>
  );
}
export default withRouter(AuthorizedUser);
