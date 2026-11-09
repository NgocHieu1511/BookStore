import { useMemo } from 'react';

function TimeAgo({ createdAt }) {
    const timeAgo = useMemo(() => {
        const now = new Date();
        const past = new Date(createdAt);
        const diffInSeconds = Math.floor((now - past) / 1000);

        const units = [
            { label: 'năm', seconds: 365 * 24 * 60 * 60 },
            { label: 'tháng', seconds: 30 * 24 * 60 * 60 },
            { label: 'ngày', seconds: 24 * 60 * 60 },
            { label: 'giờ', seconds: 60 * 60 },
            { label: 'phút', seconds: 60 },
            { label: 'giây', seconds: 1 },
        ];

        for (const unit of units) {
            const count = Math.floor(diffInSeconds / unit.seconds);
            if (count > 0) {
                return `${count} ${unit.label} trước`;
            }
        }

        return 'vừa xong';
    }, [createdAt]); // Chỉ tính lại khi `createdAt` thay đổi

    return <span>{timeAgo}</span>;
}

export default TimeAgo;
