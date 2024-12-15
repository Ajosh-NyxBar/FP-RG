// import { Groq } from "groq-sdk";

// const groq = new Groq({
//   apiKey: import.meta.env.VITE_GROQ_API_KEY,
// });

// const requestToGroq = async (prompt) => {
//   const response = await groq.chat.completions.create({
//     model: "llama3-8b-8192",
//     messages: [{ role: "user", content: prompt }],
//   });
//   return response.choices[0].message.content;
// };

// export default requestToGroq;