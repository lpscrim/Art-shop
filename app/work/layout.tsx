
export default function WorkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="border w-full">
            {children}
        </div>
    );
}