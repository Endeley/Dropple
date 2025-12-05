export function generateVariants(dna) {
  return {
    solid: `${dna.padding} ${dna.color.bg} ${dna.color.text}`,
    outline: `${dna.padding} border ${dna.color.border} ${dna.color.text}`,
    ghost: `${dna.padding} bg-transparent hover:${dna.color.bgSoft} ${dna.color.text}`,
    soft: `${dna.padding} ${dna.color.bgSoft} ${dna.color.text}`,
  };
}
