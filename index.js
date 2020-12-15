const express = require("express");
const ejsMate = require("ejs-mate");
const path = require("path");
const axios = require("axios");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index", { quiz });
})

app.post("/", (req, res) => {
    quiz = parseAnswers(req.body, quiz);
    res.redirect("/results");
})

app.get("/results", (req, res) => {
    //console.log(quiz);
    res.render("results", { quiz });
})

app.listen("3000", () => {
    console.log("App working on port 3000!");
})

const getQuiz = async () => {
    try {
        const res = await axios.get("https://opentdb.com/api.php?amount=10");
        return res.data.results;
        // Returns a promise.
    } catch (e) {
        return "No quizes awailable.";
    }
}

const randomizeOrderQuizAnswers = async () => {
    const quiz = await getQuiz();
    for (question of quiz) {
        let answers = [];
        if (question.type === "boolen") {
            answers.push("True", "False");
            question.answers = answers;
        } else {
            question.incorrect_answers.forEach(e => {
                answers.push(e);
            });
            answers.splice(Math.floor(Math.random() * answers.length), 0, question.correct_answer);
            question.answers = answers;
        }
    }
    return quiz;
}

const prepareQuiz = async () => {
    const quiz = await randomizeOrderQuizAnswers();
    let id = 0;
    for (question of quiz) {
        question.id = id;
        id++;
    }
    return quiz;
}

const createQuiz = async () => {
    quiz = await prepareQuiz();
}

function parseAnswers(answers, quiz) {
    for (let question of quiz) {
        question.usersChoice = answers[`${question.id}`];
    }

    quiz.answeredCorrectly = 0;
    for (let question of quiz) {
        if (question.usersChoice === question.correct_answer)
            quiz.answeredCorrectly++;
    }

    return quiz;
}

let quiz = {};

createQuiz();
