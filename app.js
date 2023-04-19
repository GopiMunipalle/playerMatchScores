const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get players
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT player_id as playerId,
  player_name as playerName
    FROM player_details;`;
  const getPlayersArray = await db.all(getPlayers);
  response.send(getPlayersArray);
});

//Get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT player_id as playerId,
    player_name as playerName
    FROM player_details
    WHERE player_id=${playerId};`;
  const getPlayerArray = await db.get(getPlayer);
  response.send(getPlayerArray);
});

//Update Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `UPDATE player_details
    SET player_name='${playerName}'
    WHERE player_id=${playerId};`;
  const updatePlayer = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Get Match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `SELECT match_id as matchId,
  match,
  year
    FROM match_details
    WHERE match_id=${matchId};`;
  const getMatchArray = await db.get(getMatch);
  response.send(getMatchArray);
});

//Get All Matches
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getAllMatches = `SELECT match_id as matchId,
  match,
  year
    FROM match_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId};`;
  const getAllMatchId = await db.all(getAllMatches);
  response.send(getAllMatchId);
});

//Get SpecificMatch
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getSpecificMatch = `SELECT player_id as playerId,
    player_name as playerName
    FROM player_match_score NATURAL JOIN player_details
    WHERE match_id=${matchId};`;
  const getSpecificArray = await db.all(getSpecificMatch);
  response.send(getSpecificArray);
});

//Get PlayersScore
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getTotals = `SELECT
    player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
    FROM player_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId};`;
  const getTotalArray = await db.get(getTotals);
  response.send(getTotalArray);
});

module.exports = app;
