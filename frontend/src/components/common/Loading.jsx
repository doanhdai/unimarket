const Loading = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <div className="spinner"></div>
            <p className="text-gray-500 animate-pulse">Đang tải...</p>
        </div>
    </div>
);

export default Loading;
