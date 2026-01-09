import { devResources } from "../config/dev-dev";
import { setOutput } from "../libs/github";

console.log('');
console.log('🚀 Generating Deployment Matrix for GitHub Actions');
console.log('==================================================');
console.log('');

setOutput(devResources, "deployment-matrix");

console.log('✨ Deployment matrix generation completed!');
console.log('');