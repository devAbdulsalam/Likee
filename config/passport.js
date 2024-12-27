import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
// import FacebookStrategy from 'passport-facebook';
import User from '../models/UserModel.js'; // Adjust path as needed
import dotenv from 'dotenv';
dotenv.config();

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ googleId: profile.id });

				if (!user) {
					user = await User.create({
						googleId: profile.id,
						name: profile.displayName,
						email: profile.emails[0].value,
						profileImage: profile.photos[0]?.value,
					});
				}

				return done(null, user);
			} catch (error) {
				return done(error, false);
			}
		}
	)
);

// passport.use(
// 	new FacebookStrategy(
// 		{
// 			clientID: process.env.FACEBOOK_APP_ID,
// 			clientSecret: process.env.FACEBOOK_APP_SECRET,
// 			callbackURL: process.env.FACEBOOK_CALLBACK_URL,
// 			profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
// 		},
// 		async (accessToken, refreshToken, profile, done) => {
// 			try {
// 				let user = await User.findOne({ facebookId: profile.id });

// 				if (!user) {
// 					user = await User.create({
// 						facebookId: profile.id,
// 						name: `${profile.name.givenName} ${profile.name.familyName}`,
// 						email: profile.emails?.[0]?.value || '',
// 						profileImage: profile.photos?.[0]?.value || '',
// 					});
// 				}

// 				return done(null, user);
// 			} catch (error) {
// 				return done(error, false);
// 			}
// 		}
// 	)
// );

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const user = await User.findById(id);
	done(null, user);
});

export default passport;
