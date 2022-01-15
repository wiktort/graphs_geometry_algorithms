export const usageTester = (numberOfCenters: number, numberOfCities: number) => {
  const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const timeInSeconds = Math.floor(process.uptime());

  console.log(`Number of centers ${numberOfCenters} among ${numberOfCities} cities`);
  console.log(`The script uses approximately ${Math.round(usedMemory * 100) / 100} MB`);
  console.log(`The script was running for  approximately ${timeInSeconds}s`);
};
