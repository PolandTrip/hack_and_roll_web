interface TextDisplayProps {
    msg: string;
}

const TextDisplay = ( {msg } : TextDisplayProps ) => {
    return <p>
        {msg }
    </p>
}

export default TextDisplay