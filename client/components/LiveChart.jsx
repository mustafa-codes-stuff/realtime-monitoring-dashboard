import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LiveChart({ data }) {
  // Format timestamp for display
  const formattedData = data.map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })
  }));

  return (
    <div className="h-[400px] w-full bg-gray-900/30 rounded-xl border border-gray-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickMargin={10} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickMargin={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F9FAFB' }}
            itemStyle={{ color: '#E5E7EB' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="cpuUsage" stroke="#3B82F6" strokeWidth={2} dot={false} name="CPU (%)" isAnimationActive={false} />
          <Line type="monotone" dataKey="memoryUsage" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Memory (%)" isAnimationActive={false} />
          <Line type="monotone" dataKey="requestCount" stroke="#10B981" strokeWidth={2} dot={false} name="Requests/s" isAnimationActive={false} />
          <Line type="monotone" dataKey="errorRate" stroke="#EF4444" strokeWidth={2} dot={false} name="Error Rate (%)" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
