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
`);
/*
  type FastOrSpecialAttacks{
   types: [FastSpecialAttacks]
  }
   type AllTypes {
    types: [String]
   }

*/
/*
 
    Attacks(type: String, name: String): Attacks
    FastOrSpecialAttacks(type: String)
    Types: [String]

*/

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
    console.log(data.types);
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

// query {
//   findAllPokemonOfOneType(name: "Dragon") {
//     Pokemon {
//       name
//       id
//     }
//   }
// }
