import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { UserModel } from "./Models/UserModel.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9876;
const MONGO_URL = process.env.MONGO_URL;

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "https://movie-app-wine-pi.vercel.app", // добавить адрес домена
  })
);

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      res.status(404).json({
        message: `Пользователь с почтовым адресом ${email} уже существует`,
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      username,
    });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      res
        .status(401)
        .json({ message: "'Пользователь с таким email не найден" });
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      res.status(401).json({ message: "Пароль не совпадает" });
    }

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/getMe", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      res
        .status(401)
        .json({ message: "'Пользователь с таким email не найден" });
    } else {
      res.status(201).json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/addFavoriteMovie", async (req, res) => {
  try {
    const { userId, movieId, data } = req.body;
    await UserModel.updateOne(
      { _id: userId },
      { $push: { favoritesMovies: data } } // movieId
    );

    const user = await UserModel.findOne({ _id: userId });
    const favoritesMovies = user.favoritesMovies;
    res.status(201).json(favoritesMovies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/removeFavoriteMovie", async (req, res) => {
  try {
    const { userId, movieId, data } = req.body;
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { favoritesMovies: data } }
    );

    const user = await UserModel.findOne({ _id: userId });
    const favoritesMovies = user.favoritesMovies;
    res.status(201).json(favoritesMovies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/addFavoriteTv", async (req, res) => {
  try {
    const { userId, tvId, data } = req.body;
    await UserModel.updateOne(
      { _id: userId },
      { $push: { favoritesTv: data } }
    );

    const user = await UserModel.findOne({ _id: userId });
    const favoritesTv = user.favoritesTv;
    res.status(201).json(favoritesTv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/removeFavoriteTv", async (req, res) => {
  try {
    const { userId, tvId, data } = req.body;
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { favoritesTv: data } }
    );

    const user = await UserModel.findOne({ _id: userId });
    const favoritesTv = user.favoritesTv;
    res.status(201).json(favoritesTv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
