import { gql, NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { useRef } from 'react';
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

function Users() {
  const { loading, error, data, refetch, networkStatus } = useQuery(ROOT_QUERY);
  const [addFakeUsers, { data: newUser }] = useMutation(
    ADD_FAKE_USER_MUTATION,
    { refetchQueries: ROOT_QUERY }
  );

  const inputRef = useRef();

  if (loading) return <p>Loading...</p>;
  if (networkStatus === NetworkStatus.refetch) return <p>Refetching!...</p>;
  if (error)
    return (
      <p>
        Error!
        <br /> {JSON.stringify(error)}
      </p>
    );

  return (
    <div>
      <div>
        <h2>Total Users: {data.totalUsers}</h2>
      </div>
      <div>
        {data.allUsers.map(user => (
          <div key={user.githubLogin}>
            <h4>
              ID: {user.githubLogin}
              <img
                src={user.avatar}
                style={{ width: '50px', height: '50px', marginLeft: '10px' }}
              />
            </h4>
            <h4>Name: {user.name || ''}</h4>
          </div>
        ))}
      </div>
      <button onClick={() => refetch()}>Refresh</button>
      <input name='Count' ref={inputRef} />
      <button
        onClick={() =>
          addFakeUsers({ variables: { count: +inputRef.current.value } })
        }
      >
        Add Fake Users
      </button>
    </div>
  );
}

export default Users;
