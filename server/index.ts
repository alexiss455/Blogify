import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import thirdPartyMwAuth from "./middleware/thirdpartymwAuth";
import bcrypt from "bcrypt";
dotenv.config();

//imported file
import connectToDatabase from "./database/connectDb";
import User from "./models/users.model";
import { MiddlewareLocal, CustomRequest } from "./middleware/middlewareAuth";

//mongo Db connection
connectToDatabase()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const app = express();
//middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//third Party authentication middleware
thirdPartyMwAuth();

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: Request, res: Response) => {
    const userToken = req.user as any;
    const googleUser = {
      googleId: userToken.googleId,
    };
    const secret = process.env.userLocalSecret as string;
    const token = jwt.sign(googleUser, secret, { expiresIn: "1h" });
    res.cookie("access_token", token, {
      httpOnly: true,
    });
    res.redirect("http://localhost:5173");
  }
);

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  async (req: Request, res: Response) => {
    const userToken = req.user as any;
    const googleUser = {
      googleId: userToken.googleId,
    };
    const secret = process.env.userLocalSecret as string;
    const token = jwt.sign(googleUser, secret, { expiresIn: "1h" });
    res.cookie("access_token", token, {
      httpOnly: true,
    });
    res.redirect("http://localhost:5173");
  }
);

app.get(
  "/user",
  MiddlewareLocal,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const googleUserId = req.googleUserId;
    if (userId) {
      const localUser = await User.findById(userId);
      return res.status(200).json({ authenticated: true, user: localUser });
    }
    if (googleUserId) {
      const googleUser = await User.findOne({ googleId: googleUserId });
      console.log(googleUser);
      return res.status(200).json({ authenticated: true, user: googleUser });
    }
    if (!userId || !googleUserId) {
      return res.status(401).json({ authenticated: false, message:"No user authenticated!!" });
    }
  }
);

app.get("/sign-out", async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token");
    res.status(200).send("Signed out successfully.");
  } catch (error) {
    res.status(500).send("An error occurred while signing out.");
  }
});

app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  // check if user exists
  const user:any = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message:"Invalid email or password" });
  }

  if (!user.password) {
    return res.status(401).json({ message:"Sorry, you cannot sign in with third-party authentication" });
  }
  console.log(user);

  // check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message:"Invalid email or password" });
  }
  // create a JWT token
  const payload = {
    id: user.id,
  };
  const secret = process.env.userLocalSecret as string;
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  // set the JWT token as a cookie
  res.cookie("access_token", token, {
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged in successfully", user: user });
});


app.post("/register", async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  const user = await User.findOne({ email });
  
  if (user) {
    return res.status(401).json({ message: "Email already exist!" });
  }

  if (!user) {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email,
      password: hashPassword,
      displayName: displayName,
    });
    await newUser.save();
    res.status(200).json({ message: "User created successfully", registerSuccess:true });
  }
});


app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
