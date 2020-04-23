const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: Weight
    height: Height
    fleeRate: Float
    evolutionRequirements: EvolutionRequirements
    evolutions: [Evolutions]
    maxCP: Int
    maxHP: Int
    attacks: AllAttacks
  }
  type Weight {
    minimum: String
    maximum: String
  }
  type Height {
    minimum: String
    maximum: String
  }
  type EvolutionRequirements {
    amount: Int
    name: String
  }
  type Evolutions {
    id: Int
    name: String
  }
  type AllAttacks {
    fast: [FastSpecialAttacks]
    special: [FastSpecialAttacks]
  }
  type FastSpecialAttacks {
    name: String
    type: String
    damage: String
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: String): Pokemon
    allAttacks: AllAttacks
    allTypes: [String]
    eitherFastOrSpecialAttacks(attackType: String): [FastSpecialAttacks]
    findAllPokemonOfOneType(name: String): [Pokemon]
    findPokemonWithSpecificAttack(name: String): [Pokemon]
  }
  input addNewFast {
    name: String
    type: String
    damage: String
  }
  input addNewSpecial {
    name: String
    type: String
    damage: String
  }
  input newAttacks {
    fast: [addNewFast]
    special: [addNewSpecial]
  }
  input AddNewPokemon{
    id: String
    name: String
    types: [String]
    attacks: newAttacks
  }
  input editPokemon {
    id: String
    name: String
  }
  type Mutation {
    addNewPokemon(input: AddNewPokemon): Pokemon
    editPokemon(input: editPokemon): Pokemon
    deletePokemon(input: editPokemon): Int
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => {
      if (request.id === pokemon.id || pokemon.name === request.name) {
        return pokemon;
      }
    });
  },
  allAttacks: () => {
    return data.attacks;
  },
  allTypes: () => {
    return data.types;
  },
  eitherFastOrSpecialAttacks: (request) => {
    // check if request is fast or special
    // then return data.attacks.fast/special
    return data.attacks[request.attackType];
  },
  findAllPokemonOfOneType: (request) => {
    // find all DRAGON type pokemon
    const result = [];
    data.pokemon.forEach((pokemon) => {
      if (pokemon.types.includes(request.name)) {
        result.push(pokemon);
      }
    });
    // return all DRAGON type pokemon
    return result;
  },
  findPokemonWithSpecificAttack: (request) => {
    const result = [];
    data.pokemon.forEach((pokemon) => {
      for (const att in pokemon.attacks) {
        for (let i = 0; i < pokemon.attacks[att].length; i++) {
          if (pokemon.attacks[att][i].name === request.name) {
            result.push(pokemon);
          }
        }
      }
    });
    return result;
  },
  addNewPokemon: (request) => {
    data.pokemon.push(request.input);
    return data.pokemon[data.pokemon.length - 1];
  },
  editPokemon: (request) => {
    // do something here to edit pokemon information
    return data.pokemon.find((pokemon) => {
      if (
        pokemon.id === request.input.id ||
        pokemon.name === request.input.name
      ) {
        pokemon = Object.assign(pokemon, request.input);
        return pokemon;
      }
    });
  },
  deletePokemon: (request) => {
    console.log("data.pokemon.length", data.pokemon.length);
    for (let i = 0; i < data.pokemon.length; i++) {
      if (
        data.pokemon[i].id === request.input.id ||
        data.pokemon[i].name === request.input.name
      ) {
        data.pokemon.splice(i, 1);
        return data.pokemon.length;
      }
    }
  },
};
// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});

// # {
// #   Pokemons {
// #     id
// #
//   }
// #
// }

// # {
// #   Pokemon(name: "Bulbasaur") {
// #     id
// #     name
// #     classification
// #     types
// #     resistant
// # 		weight {
// # 		  minimum
// # 		  maximum
// #
//     }
// #     height {
// #       minimum
// #       maximum
// #
//     }
// #     fleeRate
// #     evolutionRequirements {
// #       amount
// #       name
// #
//     }
// #     evolutions {
// #       id
// #       name
// #
//     }
// #     maxCP
// #     maxHP
// #     attacks {
// #       fast {
// #         name
// #         type
// #         damage
// #
//       }
// #       special {
// #         name
// #         type
// #         damage
// #
//       }
// #
//     }
// #
//   }
// #
// }

// # {
// #   Pokemons {
// #     id
// #
//   }
// #
// }

// # {
// #   allAttacks {
// #     special {
// #       name
// #       type
// #       damage
// #
//     }
// #
//   }
// #
// }

// # {
// #   allTypes
// #
// }

// # {
// #   eitherFastOrSpecialAttacks(attackType: "special") {
// #     name
// #     type
// #     damage
// #
//   }
// #
// }

// # query {
// #   findAllPokemonOfOneType(name: "Dragon") {
// #     name
// #     id
// #
//   }
// #
// }

// query {
//   findPokemonWithSpecificAttack(name: "Solar Beam") {
//     name
//     id
//   }
// }

// mutation {
//   input addNewPokemon(id: "333", name: "HaleeAizhan") {
//     Pokemons {
//       id
//       name
//     }
//   }
// }

// # mutation {
// #   addNewPokemon(input: {
//   id: "333", name: "HaleeAizhan", type: ["Grass", "Fire"], attacks: { fast: [{ name: "fast_att", type: "fire_type", damage: "60" }], special: [{ name: "special_att", type: "grass_type", damage: "50" }] }
// #   }) {
// #  Pokemons {
// #     id
// #     name
// #
//     }
// #
//   }
// #
// }
// mutation {
//   addNewPokemon(input: { id: "333", name: "HaleeAizhan", types: ["Grass", "Fire"] }) {
//     id
//     name
//     types
//   }
// }
// mutation {
//   editPokemon(input: { id: "001", name: "AizhanHalee" }) {
//     id
//     name
//   }
// }
