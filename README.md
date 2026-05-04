![Concept Calculator Banner](public/ogImage.png)

# CC-1 Concept Calculator
CC-1 is an LLM-powered word arithmetic calculator designed & developed by [Maximillian Piras](https://www.maximillian.nyc) as an experiment to explore AI UX [beyond chatbots](https://www.smashingmagazine.com/2024/02/designing-ai-beyond-conversational-interfaces/). It allows you to insert concepts, as in any collection of words representing some notion of cultural significance, to perform mathematical operations (+, -, ×, ÷) resulting in a logical ‘solution’. 

<!-- ## Intention
This interface intends to make it easy to peer into an LLM's world model by seeing what connections it draws between concepts. However, the results are far from the objectivity of a numerical calculation, as they're inextricably influenced by necessary prompt engineering. To account for this subjectivity, all the code is open-sourced so anyone can look under the hood. If this project isn't instructive at all, hopefully, it at least serves as a fun toy that spits out some entertaining answers. -->

## Calculator Controls
As you’ll see if you take a look at the system prompt (see `cc-proxy-server/server.js`), these are each operation’s current definitions. The intent was to draw a logical counterpart to their mathematical operation which would yield an equivalent semantic result, but this is still a work in progress.

`(+) Addition` Combine defining traits or core characteristics to expand on or blend input concepts while maintaining their identifiable characteristics.

`(-) Subtraction` Remove defining traits or core characteristics, leading to a diminished or simplified version of the input concepts.

`(×) Multiplication` Amplify or exaggerates defining traits or core characteristic, resulting in a more powerful, enhanced version of the input concepts. The output should feel greater than the sum of its parts.

`(÷) Division` Breakdown input concepts into specific, smaller components or fragments, with a narrower scope or purpose. The result should be more specific or focused, often resulting in a subset or fragment of the input concepts.

## Model(s)
Default API models aim for cost efficiency: OpenAI **GPT-5.4 mini** (concept solver), **GPT-5.4 nano** (emoji), and Anthropic **Claude Haiku 4.5** (alternate solver). The proxy can override these with the optional environment variables `OPENAI_MODEL_CONCEPT`, `OPENAI_MODEL_EMOJI`, and `ANTHROPIC_MODEL_CONCEPT`.

<!-- ## Evals
Add eval framework in here. -->

## License

CC-1 is under the MIT License.