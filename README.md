# Relay Roster

_by Nicholas Neumann-Chun_

_based on the [Relay Starter Kit](https://github.com/relayjs/relay-starter-kit)_

## Description

Use GraphQL to query a simple dataset consisting of students, instructors, courses, and grades.  Uses Relay.

## Getting It Started

Do `npm install` and `npm run update`.  Then go to `localhost:3000/graphql` and try, for example,

```
query {
  instructors {
    edges {
      cursor
      node {
        name
      }
    }
  }
}
```

## License

Relay Starter Kit is [BSD licensed](./LICENSE). Facebook also provides an additional [patent grant](./PATENTS).
