
// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const movieSchema = new Schema(
//   {
//     tmdbId: { 
//       type: Number, 
//       required: true, 
//       unique: true 
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     originalTitle: {
//       type: String,
//     },
//     overview: {
//       type: String,
//     },
//     genres: [
//       {
//         id: Number,
//         name: String,
//       },
//     ],
//     releaseDate: {
//       type: Date,
//     },
//     runtime: {
//       type: Number, // Duration in minutes
//     },
//     language: {
//       type: String, // ISO 639-1 code
//     },
//     posterPath: {
//       type: String,
//     },
//     backdropPath: {
//       type: String,
//     },
//     popularity: {
//       type: Number,
//     },
//     voteAverage: {
//       type: Number,
//     },
//     voteCount: {
//       type: Number,
//     },
//     video: {
//       type: Boolean,
//     },
//     adult: {
//       type: Boolean,
//     },
//     reviews: [
//       {
//         userName: { type: String, required: true },
//         userImage: { type: String },
//         rating: { type: Number, required: true },
//         comment: { type: String, required: true },
//         userId: {
//           type: Schema.Types.ObjectId,
//           ref: 'User',
//           required: true,
//         },
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     cast: [
//       {
//         name: { type: String, required: true },
//         character: { type: String },
//         profilePath: { type: String },
//       },
//     ],
//     crew: [
//       {
//         name: { type: String, required: true },
//         job: { type: String },
//         department: { type: String },
//         profilePath: { type: String },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model('Movie', movieSchema);
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Review Schema
const reviewSchema = new Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Movie Schema
const movieSchema = new Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  originalTitle: { type: String },
  overview: { type: String },
  genres: [{ id: Number, name: String }],
  releaseDate: { type: Date },
  runtime: { type: Number },
  language: { type: String },
  posterPath: { type: String },
  backdropPath: { type: String },
  popularity: { type: Number },
  voteAverage: { type: Number },
  voteCount: { type: Number },
  video: { type: Boolean },
  adult: { type: Boolean },
  reviews: [reviewSchema],
}, { timestamps: true });


export default mongoose.model('Movie', movieSchema);