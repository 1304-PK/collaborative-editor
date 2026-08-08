const BoardUpdateCard = ({ x, y, userName, userColor }) => {
  console.log("usercolor", userColor)
  return (
    <div
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 9999,

        backgroundColor: userColor,
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",

        fontSize: "14px",
        fontWeight: 600,
        whiteSpace: "nowrap",

        display: "flex",
        alignItems: "center",
        gap: "8px",

        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(8px)",

        animation: "boardUpdatePop 0.3s ease-out",
        pointerEvents: "none",
      }}
    >
      <span>{userName} updated the board</span>
    </div>
  );
};

export default BoardUpdateCard;