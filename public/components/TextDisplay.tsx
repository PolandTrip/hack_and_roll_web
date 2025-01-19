interface TextDisplayProps {
    msg: string;
  }
  
  const TextDisplay: React.FC<TextDisplayProps> = ({ msg }) => {
    return (
      <p style={{ fontSize: "16px", color: "#333", marginTop: "10px" }}>
        {msg}
      </p>
    );
  };
  
  export default TextDisplay;