import { gql, NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { Button, Input, List } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ROOT_QUERY } from './App';

const ADD_FAKE_USER_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
      name
      avatar
    }
  }
`;

function Users({ loading, error, data, subscribeNewUser }) {
  const [addFakeUsers] = useMutation(ADD_FAKE_USER_MUTATION, {
    refetchQueries: ROOT_QUERY
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    subscribeNewUser();
  }, []);

  console.log(data);
  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <p>
        Error!
        <br /> {JSON.stringify(error)}
      </p>
    );

  return (
    <List style={{ width: '70%', margin: 'auto' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}
      >
        <Input
          name='Count'
          onChange={({ target: { value } }) => setCount(+value)}
          style={{ marginRight: '20px' }}
        />
        <Button
          onClick={() => addFakeUsers({ variables: { count } })}
          type='primary'
        >
          Add Fake Users
        </Button>
      </div>
      <div style={{ margin: '0 20px' }}>
        <h2>
          <b>Total Users: {data.allUsers.length}</b>
        </h2>
      </div>
      <div style={{ width: '90%', margin: 'auto' }}>
        {data.allUsers.map(user => (
          <List.Item key={user.githubLogin}>
            <h4>
              <img
                src={user.avatar}
                style={{ width: '50px', height: '50px', marginRight: '20px' }}
                alt=''
              />
              {user.githubLogin}
            </h4>
            <h4>{user.name || user.githubLogin}</h4>
          </List.Item>
        ))}
      </div>
    </List>
  );
}

export default Users;
